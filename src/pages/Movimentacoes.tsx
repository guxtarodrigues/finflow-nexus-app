
// Inside the fetchCategories function
const fetchCategories = async () => {
  try {
    if (!user) return;
    
    setLoadingCategories(true);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .in('type', ['income', 'expense'])
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    setCategories(data || []);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
  } finally {
    setLoadingCategories(false);
  }
};
