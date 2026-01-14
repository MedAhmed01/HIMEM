# Troubleshooting - Erreur Upload 401

## Problème

**Erreur :** `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Contexte :** Lors de l'upload du reçu de paiement dans la page d'abonnement

## Causes Possibles

### 1. Session non transmise
Les cookies de session Supabase ne sont pas transmis avec la requête fetch.

### 2. Bucket storage non créé
Le bucket `receipts` n'existe pas dans Supabase Storage.

### 3. Policies storage manquantes
Les policies d'accès au bucket ne sont pas configurées.

### 4. Service role key manquante
La variable d'environnement `SUPABASE_SERVICE_ROLE_KEY` n'est pas définie.

## Solutions Appliquées

### ✅ 1. Ajout de `credentials: 'include'`

**Fichier :** `app/entreprise/abonnement/page.tsx`

```typescript
const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include' // ← Ajouté
})
```

Cela garantit que les cookies de session sont envoyés avec la requête.

### ✅ 2. Utilisation du client admin

**Fichier :** `app/api/upload/route.ts`

```typescript
// Utiliser le client admin pour l'upload (bypass RLS)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Upload avec le client admin
const { data, error } = await supabaseAdmin.storage
  .from('receipts')
  .upload(fileName, buffer, {
    contentType: file.type,
    upsert: false
  })
```

Le client admin bypass les Row Level Security policies.

### ✅ 3. Conversion File → Buffer

```typescript
// Convertir le File en ArrayBuffer puis en Buffer
const arrayBuffer = await file.arrayBuffer()
const buffer = Buffer.from(arrayBuffer)
```

Nécessaire pour l'upload côté serveur.

### ✅ 4. Logging détaillé

Ajout de logs pour diagnostiquer :
- État de l'authentification
- Informations du fichier
- Erreurs détaillées

## Vérifications à Faire

### 1. Vérifier la session utilisateur

Ouvrez la console du navigateur et vérifiez :

```javascript
// Dans la console du navigateur
document.cookie
```

Vous devriez voir des cookies Supabase (`sb-*`).

### 2. Vérifier le bucket storage

Dans Supabase Dashboard :
1. Allez dans **Storage**
2. Vérifiez que le bucket `receipts` existe
3. Vérifiez qu'il est configuré comme **public**

### 3. Vérifier les policies

Dans Supabase Dashboard > Storage > receipts > Policies :

Vous devriez avoir :
- ✅ Users can upload their own receipts
- ✅ Users can view their own receipts
- ✅ Admins can view all receipts
- ✅ Public can view receipts

### 4. Vérifier les variables d'environnement

Dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  ← Important !
```

### 5. Tester l'authentification

Créez un fichier de test :

```typescript
// app/api/test-auth/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return NextResponse.json({
    authenticated: !!user,
    userId: user?.id,
    error: error?.message
  })
}
```

Puis visitez `/api/test-auth` dans votre navigateur.

## Commandes de Diagnostic

### Vérifier les logs serveur

```bash
# Logs de l'application
npm run dev

# Chercher "Upload -" dans les logs
```

### Vérifier les logs Supabase

Dans Supabase Dashboard :
1. Allez dans **Logs**
2. Sélectionnez **Storage**
3. Cherchez les erreurs d'upload

## Si le Problème Persiste

### Option 1 : Recréer le bucket

```sql
-- Dans Supabase SQL Editor
DELETE FROM storage.buckets WHERE id = 'receipts';

-- Puis réexécuter la migration
-- supabase/migrations/add_subscription_payment_fields_v2.sql
```

### Option 2 : Upload direct sans API

Modifiez le code pour uploader directement depuis le client :

```typescript
// Dans app/entreprise/abonnement/page.tsx
const supabase = createClientComponentClient()

const { data, error } = await supabase.storage
  .from('receipts')
  .upload(`${userId}/subscription_receipt/${Date.now()}.${ext}`, receiptFile)
```

**Note :** Cette approche nécessite que le bucket soit accessible côté client.

### Option 3 : Vérifier le middleware

Vérifiez que le middleware ne bloque pas les requêtes API :

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## Résumé des Changements

| Fichier | Changement | Raison |
|---------|-----------|--------|
| `app/api/upload/route.ts` | Utilisation du client admin | Bypass RLS |
| `app/api/upload/route.ts` | Conversion File → Buffer | Upload côté serveur |
| `app/api/upload/route.ts` | Logs détaillés | Diagnostic |
| `app/entreprise/abonnement/page.tsx` | `credentials: 'include'` | Transmission cookies |
| `app/entreprise/abonnement/page.tsx` | Meilleure gestion erreurs | UX |

## Test Final

1. Connectez-vous en tant qu'entreprise
2. Allez sur `/entreprise/abonnement`
3. Cliquez "Souscrire" sur un forfait
4. Sélectionnez un fichier (JPG, PNG ou PDF < 5MB)
5. Cliquez "Confirmer"
6. Vérifiez les logs dans la console
7. ✅ L'upload devrait réussir

## Logs Attendus

```
Upload - Auth check: { hasUser: true, userId: 'xxx-xxx-xxx' }
Upload - File info: { hasFile: true, fileName: 'receipt.jpg', fileSize: 123456, fileType: 'image/jpeg' }
Upload - Attempting upload: { fileName: 'xxx/subscription_receipt/1234567890.jpg' }
Upload - Success: { path: 'xxx/subscription_receipt/1234567890.jpg' }
```
