-- Approved members can see who won a giveaway — winners are announced
-- publicly within the community anyway (PRD §4.3), and the member portal
-- needs this to answer "did I win?" without a service-role round trip.
create policy giveaway_winners_select_for_members on giveaway_winners
  for select using (
    exists (select 1 from members m where m.auth_user_id = auth.uid() and m.registration_status = 'approved')
  );
