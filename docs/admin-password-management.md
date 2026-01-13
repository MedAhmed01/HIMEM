# Gestion des mots de passe par l'admin

## Fonctionnalité

L'admin peut maintenant modifier directement les mots de passe des utilisateurs (ingénieurs et entreprises) sans passer par un email de réinitialisation.

## Comment utiliser

### Pour les ingénieurs
1. Aller sur `/admin/ingenieurs`
2. Cliquer sur l'icône clé (🔑) à côté de l'ingénieur
3. Saisir le nouveau mot de passe (minimum 6 caractères)
4. Confirmer le mot de passe
5. Cliquer sur "Modifier le mot de passe"

### Pour les entreprises
1. Aller sur `/admin/entreprises`
2. Cliquer sur l'icône clé (🔑) à côté de l'entreprise
3. Saisir le nouveau mot de passe (minimum 6 caractères)
4. Confirmer le mot de passe
5. Cliquer sur "Modifier le mot de passe"

## Sécurité

- Seuls les admins peuvent modifier les mots de passe
- Le mot de passe doit contenir au moins 6 caractères
- La confirmation du mot de passe est obligatoire
- L'opération utilise l'API Admin de Supabase pour une sécurité maximale

## Interface utilisateur

- Modal avec validation en temps réel
- Indicateurs visuels pour la force du mot de passe
- Boutons pour afficher/masquer les mots de passe
- Messages de succès/erreur
- Chargement avec spinner pendant l'opération

## API

**Endpoint:** `POST /api/admin/change-password`

**Paramètres:**
- `userId`: ID de l'utilisateur
- `newPassword`: Nouveau mot de passe
- `userType`: "ingenieur" ou "entreprise"

**Réponse:**
- Succès: `{ success: true, message: "..." }`
- Erreur: `{ error: "..." }`