#!/usr/bin/env bash
# Tests supabase/sql/50-rooms.sql on a throwaway local PostgreSQL (16): Supabase's auth.uid() is stood in for by a
# session setting. Checks: stable re-claim, matching into the same room, capacity never exceeded under parallel claims,
# NPC places (free beds) taken by later players, a changed choice moving the player, the roster showing only one's own
# room. Run: bash scripts/rooms-sql-test.sh
set -euo pipefail
BIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
DIR=$(mktemp -d)
PORT=55432
if [ "$(id -u)" = 0 ]; then RUN="su postgres -s /bin/bash -c"; chown -R postgres "$DIR"; else RUN="bash -c"; fi
cleanup() { $RUN "$BIN/pg_ctl -D $DIR/db stop -m fast" >/dev/null 2>&1 || true; rm -rf "$DIR"; }
trap cleanup EXIT
$RUN "$BIN/initdb -D $DIR/db -A trust -U postgres >/dev/null && $BIN/pg_ctl -D $DIR/db -o '-p $PORT -k $DIR' -l $DIR/log start -w >/dev/null"
PSQL="psql -h $DIR -p $PORT -U postgres -v ON_ERROR_STOP=1 -q -X"
$PSQL -c "create database t" postgres
$PSQL t <<'SQL'
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
create role authenticated; create role anon;
create table public.profiles (id uuid primary key references auth.users, name text, look jsonb);
SQL
$PSQL t -f supabase/sql/50-rooms.sql
$PSQL t -f supabase/sql/50-rooms.sql   # safe to run again
# users
$PSQL t -c "insert into auth.users select ('00000000-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid from generate_series(1, 60) g;
            insert into public.profiles select id, 'P' || right(id::text, 3), null from auth.users;"
u() { printf '00000000-0000-0000-0000-%012d' "$1"; }
claim() { $PSQL t -At -c "set test.uid = '$(u "$1")'; select room || ':' || bed || ':' || capacity from public.claim_room('$2', '$3', '$4');"; }
fail=0
check() { if [ "$1" = "$2" ]; then echo "ok   $3"; else echo "FAIL $3 (got '$1', want '$2')"; fail=1; fi; }
# 1. stable: the same choice again keeps the same room and bed
a=$(claim 1 vikings '' vk-2); b=$(claim 1 vikings '' vk-2)
check "$a" "$b" "re-claim keeps room and bed ($a)"
# 2. the next compatible player shares that room, taking the free (NPC) bed
c=$(claim 2 vikings '' vk-2)
check "${c%%:*}" "${a%%:*}" "second compatible player matched into the same two-person room"
check "$(echo "$c" | cut -d: -f2)" "1" "second player gets the other bed"
# 3. a third player cannot overfill it: a new room
d=$(claim 3 vikings '' vk-2)
[ "${d%%:*}" != "${a%%:*}" ] && echo "ok   third player opens another room (${d%%:*})" || { echo "FAIL third player overfilled"; fail=1; }
# 4. AC and non-AC are not mixed
e=$(claim 4 vikings '' vk-2-ac)
[ "${e%%:*}" != "${d%%:*}" ] && echo "ok   AC double kept apart from the non-AC double" || { echo "FAIL AC mixed"; fail=1; }
# 5. a different hall never shares
f=$(claim 5 jean-nelson '' dia-2)
check "$($PSQL t -At -c "select count(distinct building) from public.room_places where room = '${f%%:*}' and building = 'jean-nelson'")" "1" "other halls separate"
# 6. invalid combinations are refused (category from another hall, missing block)
if $PSQL t -c "set test.uid = '$(u 6)'; select * from public.claim_room('vikings', '', 'dia-4');" >/dev/null 2>&1; then echo "FAIL foreign category accepted"; fail=1; else echo "ok   category from another hall refused"; fi
if $PSQL t -c "set test.uid = '$(u 6)'; select * from public.claim_room('new-pent', '', 'np-2');" >/dev/null 2>&1; then echo "FAIL missing block accepted"; fail=1; else echo "ok   New Pent without a block refused"; fi
# 7. parallel sign-ups into four-person rooms (40 players at once): no room above four, every bed distinct
for i in $(seq 11 50); do (claim "$i" jean-nelson '' dia-4 >/dev/null) & done; wait
over=$($PSQL t -At -c "select count(*) from (select room from public.room_places where building = 'jean-nelson' and category = 'dia-4' group by room having count(*) > 4) x")
check "$over" "0" "40 parallel claims: no four-person room over capacity"
dup=$($PSQL t -At -c "select count(*) from (select room, bed from public.room_places group by building, block, room, bed having count(*) > 1) x")
check "$dup" "0" "no bed held twice"
full=$($PSQL t -At -c "select count(*) from (select room from public.room_places where building = 'jean-nelson' and category = 'dia-4' group by room) x")
check "$full" "10" "40 players fill exactly 10 four-person rooms"
# 8. the roster: one's own room only, with roommates' names
r=$($PSQL t -At -c "set test.uid = '$(u 1)'; select string_agg(bed || '=' || name || (case when you then '*' else '' end), ',') from public.room_roster();")
check "$r" "0=P001*,1=P002" "roster shows only the caller's room"
# 9. a changed choice moves the player and frees the bed; staying signed out does not (rows persist)
claim 2 vikings '' vk-1 >/dev/null
r=$($PSQL t -At -c "set test.uid = '$(u 1)'; select count(*) from public.room_roster();")
check "$r" "1" "roommate who changed category left the room (their bed back to an NPC)"
g=$(claim 7 vikings '' vk-2)
[ "${g%%:*}" = "${a%%:*}" ] || [ "${g%%:*}" = "${d%%:*}" ] && echo "ok   a newcomer takes a free (NPC) place in an existing room (${g%%:*}), not a new room" || { echo "FAIL newcomer opened a new room while places were free"; fail=1; }
check "$($PSQL t -At -c "select max(n) from (select count(*) n from public.room_places where building = 'vikings' and category = 'vk-2' group by room) x")" "2" "still no two-person room above two"
# 10. leave_room gives up the place
$PSQL t -c "set test.uid = '$(u 7)'; select public.leave_room();" >/dev/null
check "$($PSQL t -At -c "select count(*) from public.room_places where user_id = '$(u 7)'")" "0" "leave_room gives up the place"
# 11. for the game's runtime check: a four-person room with two real players, then a third joining (an NPC's place),
# then the first signing in again (ROSTER_OUT=file writes the server's rows as JSON)
if [ -n "${ROSTER_OUT:-}" ]; then
  roster() { $PSQL t -At -c "set test.uid = '$(u "$1")'; select coalesce(json_agg(row_to_json(x)), '[]') from public.room_roster() x;"; }
  claim 51 limann '' dia-4 >/dev/null; claim 52 limann '' dia-4 >/dev/null
  r1=$(roster 51)
  claim 53 limann '' dia-4 >/dev/null
  r2=$(roster 51)
  again=$(claim 51 limann '' dia-4); r3=$(roster 51)
  printf '{"twoReal": %s, "threeReal": %s, "reclaim": "%s", "afterReclaim": %s}\n' "$r1" "$r2" "$again" "$r3" > "$ROSTER_OUT"
  echo "ok   roster rows written for the game check"
fi
echo "rooms SQL: $([ $fail = 0 ] && echo ok || echo FAILED)"
exit $fail
