# Réinitialisation de mot de passe par l'administrateur

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs de réinitialiser les mots de passe des ingénieurs et des entreprises directement depuis l'interface d'administration.

## Comment utiliser

### Pour les ingénieurs
1. Aller sur la page **Admin > Ingénieurs**
2. Trouver l'ingénieur concerné
3. Cliquer sur le bouton avec l'icône clé (🔑) à côté de ses informations
4. Confirmer l'action dans la boîte de dialogue
5. Un email de réinitialisation sera envoyé à l'adresse email de l'ingénieur

### Pour les entreprises
1. Aller sur la page **Admin > Entreprises**
2. Trouver l'entreprise concernée
3. Cliquer sur le bouton avec l'icône clé (🔑) à côté de ses informations
4. Confirmer l'action dans la boîte de dialogue
5. Un email de réinitialisation sera envoyé à l'adresse email de l'entreprise

## Processus de réinitialisation

1. **L'administrateur clique sur le bouton de réinitialisation**
   - Une confirmation est demandée
   - L'API vérifie que l'utilisateur existe
   - Un email de réinitialisation est généré via Supabase Auth

2. **L'utilisateur reçoit l'email**
   - L'email contient un lien sécurisé
   - Le lien redirige vers `/reset-password`
   - Le lien expire après un certain temps (configuré dans Supabase)

3. **L'utilisateur définit son nouveau mot de passe**
   - Saisie du nouveau mot de passe (minimum 6 caractères)
   - Confirmation du mot de passe
   - Validation et mise à jour via Supabase Auth
   - Redirection automatique vers la page de connexion

## Sécurité

- ✅ Seuls les administrateurs peuvent déclencher la réinitialisation
- ✅ Les liens de réinitialisation expirent automatiquement
- ✅ Les mots de passe sont hachés par Supabase Auth
- ✅ Validation côté client et serveur
- ✅ Messages d'erreur informatifs sans révéler d'informations sensibles

## Messages d'erreur courants

- **"Utilisateur non trouvé"** : L'ID utilisateur n'existe pas dans la base de données
- **"Type d'utilisateur invalide"** : Le type doit être 'ingenieur' ou 'entreprise'
- **"Erreur lors de l'envoi de l'email"** : Problème avec le service email de Supabase
- **"Les mots de passe ne correspondent pas"** : Les deux champs de mot de passe sont différents
- **"Le mot de passe doit contenir au moins 6 caractères"** : Validation de longueur minimale

## Configuration requise

- Variables d'environnement Supabase configurées
- Service email Supabase activé
- Politiques RLS appropriées pour les tables `profiles` et `entreprises`
- URL de redirection configurée dans Supabase Auth

## API Endpoint

**POST** `/api/admin/reset-password`

```json
{
  "userId": "uuid-de-l-utilisateur",
  "userType": "ingenieur" | "entreprise"
}
```

**Réponse de succès:**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé à user@example.com"
}
```

**Réponse d'erreur:**
```json
{
  "error": "Message d'erreur descriptif"
}
```