# Fix - Erreur Upload 401 (Unauthorized)

## ❌ Problème
L'upload du reçu de paiement échouait avec une erreur 401 (Non authentifié).

## ✅ Solutions Appliquées

### 1. Ajout de `credentials: 'include'` (Frontend)
**Fichier :** `app/entreprise/abonnement/page.tsx`

```typescript
const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include' // ← Transmet les cookies de session
})
```

### 2. Utilisation du Client Admin (Backend)
**Fichier :** `app/api/upload/route.ts`

- ✅ Utilise `createAdminClient` pour bypass RLS
- ✅ Convertit File → Buffer pour upload serveur
- ✅ Ajoute des logs détaillés pour diagnostic

```typescript
// Client admin pour bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Conversion File → Buffer
const arrayBuffer = await file.arrayBuffer()
const buffer = Buffer.from(arrayBuffer)

// Upload avec admin client
await supabaseAdmin.storage.from('receipts').upload(fileName, buffer, {...})
```

### 3. Meilleure Gestion des Erreurs

- Messages d'erreur plus détaillés
- Logs pour diagnostic
- Retour des détails d'erreur au client

## 🔍 Vérifications Nécessaires

Avant de tester, assurez-vous que :

1. ✅ Le bucket `receipts` existe dans Supabase Storage
2. ✅ Les policies storage sont créées (via migration SQL)
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` est définie dans `.env.local`
4. ✅ L'utilisateur est bien connecté (cookies de session présents)

## 🧪 Test

1. Connectez-vous en tant qu'entreprise
2. Allez sur `/entreprise/abonnement`
3. Cliquez "Souscrire"
4. Sélectionnez un fichier (JPG/PNG/PDF < 5MB)
5. Cliquez "Confirmer"
6. ✅ L'upload devrait réussir

## 📋 Checklist

- [x] `credentials: 'include'` ajouté au fetch
- [x] Client admin utilisé pour l'upload
- [x] Conversion File → Buffer implémentée
- [x] Logs de diagnostic ajoutés
- [x] Gestion d'erreur améliorée
- [x] Documentation créée

## 📚 Documentation

Pour plus de détails, voir : `TROUBLESHOOTING_UPLOAD.md`
