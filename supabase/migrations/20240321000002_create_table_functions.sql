-- Function to create recipes table
CREATE OR REPLACE FUNCTION create_recipes_table_sql()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create recipes table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.recipes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT,
        instructions TEXT[] NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        ingredients JSONB NOT NULL,
        image_url TEXT,
        time_minutes INTEGER,
        servings INTEGER,
        difficulty TEXT,
        source_url TEXT
    );

    -- Enable RLS for recipes
    ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

    -- Create policy for recipes
    DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
    CREATE POLICY "Public recipes are viewable by everyone"
        ON public.recipes
        FOR SELECT
        USING (true);
END;
$$;

-- Function to create favorites table
CREATE OR REPLACE FUNCTION create_favorites_table_sql()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create favorites table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(user_id, recipe_id)
    );

    -- Enable RLS for favorites
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

    -- Create policies for favorites
    DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
    CREATE POLICY "Users can view their own favorites"
        ON public.favorites
        FOR SELECT
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
    CREATE POLICY "Users can insert their own favorites"
        ON public.favorites
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
    CREATE POLICY "Users can delete their own favorites"
        ON public.favorites
        FOR DELETE
        USING (auth.uid() = user_id);
END;
$$; 