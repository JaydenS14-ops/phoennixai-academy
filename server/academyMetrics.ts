export function calculateConversionRate(totalViews: number, totalLeads: number) {
  if (totalViews <= 0) return 0;
  return Number(((totalLeads / totalViews) * 100).toFixed(1));
}
