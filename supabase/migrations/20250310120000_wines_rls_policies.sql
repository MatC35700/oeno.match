-- RLS sur wines : chaque utilisateur ne voit et ne modifie que ses propres lignes.
-- Sans ces policies, les requêtes depuis l'app (avec JWT) peuvent renvoyer 0 ligne.

-- Activer RLS sur la table
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

-- Lecture : l'utilisateur ne voit que ses vins
CREATE POLICY "Users can read own wines"
ON public.wines FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insertion : l'utilisateur ne peut insérer qu'avec son propre user_id
CREATE POLICY "Users can insert own wines"
ON public.wines FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Mise à jour : l'utilisateur ne peut modifier que ses vins
CREATE POLICY "Users can update own wines"
ON public.wines FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Suppression (soft delete) : l'utilisateur ne peut modifier que ses vins
CREATE POLICY "Users can delete own wines"
ON public.wines FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
