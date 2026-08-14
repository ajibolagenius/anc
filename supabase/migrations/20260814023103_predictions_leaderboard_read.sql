-- Approved members can see other members' SCORED predictions (for the
-- leaderboard) but never their picks before a match is scored — that would
-- let people copy each other's guesses before kickoff, undermining the whole
-- point of a prediction game. predictions_select_own (existing policy)
-- already covers a member's own not-yet-scored picks.
create policy predictions_select_scored_for_leaderboard on predictions
  for select using (
    points_awarded is not null
    and exists (select 1 from members m where m.auth_user_id = auth.uid() and m.registration_status = 'approved')
  );
