
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function ProfilePhotoUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      getExistingAvatar();
    }
  }, [user]);

  async function getExistingAvatar() {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();
      
      if (profileData?.avatar_url) {
        setAvatarUrl(profileData.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao buscar avatar:', error);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload da imagem para o bucket 'profile_photos'
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Atualizar a URL do avatar no perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(avatarUrl);
      toast({
        title: "Foto de perfil atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro durante upload:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar foto",
        description: "Não foi possível atualizar sua foto de perfil.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 border-2 border-[#2A2A2E]">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Foto de perfil" />
        ) : (
          <AvatarFallback className="bg-[#2A2A2E]">
            <User className="h-12 w-12 text-[#94949F]" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="relative border-[#3A3A3E] hover:bg-[#2A2A2E]"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Alterar foto
            </>
          )}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </Button>
      </div>
    </div>
  );
}
