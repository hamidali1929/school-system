import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://exfmjjbjphwqvirn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeHpleGZtampianBod3F2aXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTYzMzMsImV4cCI6MjA4NzYzMjMzM30.lVElxtU8rxsGW7N0RmBSUjORl_uZC6A7OuB4nqWh10s');
const student = {id: 'test', name: 'test', class: 'test', status: 'Active', performance: 'A', avatar: '', feesPaid: 0, feesTotal: 0};
sb.from('students').insert(student).then(console.log);
