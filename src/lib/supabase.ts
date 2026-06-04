import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hgkgmhuxgsmaxficovdh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhna2dtaHV4Z3NtYXhmaWNvdmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzQ4OTUsImV4cCI6MjA5MTI1MDg5NX0.FeQQ02NaO2sFkliH_FP2CJQRIa2t5mlvG0GNFgFl1Ec';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
