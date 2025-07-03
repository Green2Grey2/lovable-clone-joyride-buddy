-- Phase 5: Create verification analytics view
CREATE VIEW verification_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_entries,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_count,
  COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_count,
  AVG(CASE 
    WHEN verified_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (verified_at - created_at))/3600 
  END) as avg_verification_time_hours,
  COUNT(CASE WHEN verification_status = 'verified' AND verification_required = false THEN 1 END) as auto_verified_count
FROM public.activities
WHERE entry_method = 'quick_entry'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;