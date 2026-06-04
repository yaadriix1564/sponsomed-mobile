import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ezzfrpmkdreujlibnlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6emZycG1rZHJldWpsaWJubGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDMzOTYsImV4cCI6MjA5MDExOTM5Nn0.7Jbrqzw7DAoDT-oxiSKdsgIkbiKNoBxVwL2PTYmUz_8'
);
