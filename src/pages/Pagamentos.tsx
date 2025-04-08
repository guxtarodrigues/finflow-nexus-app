
// Inside the fetchCategories function
const fetchCategories = async () => {
  try {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    setCategories(data || []);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
  }
};

// Inside the fetchClients function
const fetchClients = async () => {
  try {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    setClients(data || []);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
  }
};
