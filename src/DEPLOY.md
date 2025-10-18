# Guia de Deploy para Produção

## 📦 Como colocar em produção

Existem várias opções para colocar sua aplicação em produção. Aqui estão as mais recomendadas:

---

## Opção 1: Vercel (Recomendado - Mais Fácil)

A Vercel é a opção mais simples e rápida para deploy de aplicações React.

### Passos:

1. **Criar conta na Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub, GitLab ou Bitbucket

2. **Preparar o código**
   - Crie um repositório no GitHub com seu código
   - Faça commit de todos os arquivos

3. **Fazer Deploy**
   - Na Vercel, clique em "New Project"
   - Importe seu repositório do GitHub
   - A Vercel detectará automaticamente que é um projeto React
   - Clique em "Deploy"

4. **Configurar variáveis de ambiente (opcional)**
   - Se quiser, pode mover as credenciais do Firebase para variáveis de ambiente
   - Em Settings > Environment Variables
   - Adicione: `VITE_FIREBASE_API_KEY`, etc.

✅ **Pronto!** Sua aplicação estará no ar em alguns minutos.

**URL:** Você receberá um link como `https://seu-projeto.vercel.app`

---

## Opção 2: Firebase Hosting

Como você já está usando Firebase, pode hospedar tudo junto.

### Passos:

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Fazer login**
   ```bash
   firebase login
   ```

3. **Inicializar Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Escolha seu projeto existente
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Automatic builds: `No`

4. **Build da aplicação**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

✅ **URL:** `https://seu-projeto.web.app`

---

## Opção 3: Netlify

Similar à Vercel, muito fácil de usar.

### Passos:

1. **Criar conta**
   - Acesse: https://netlify.com
   - Faça login com GitHub

2. **Deploy**
   - Arraste a pasta `dist` (após fazer build) direto no site
   - Ou conecte seu repositório GitHub

3. **Configurar**
   - Build command: `npm run build`
   - Publish directory: `dist`

✅ **URL:** `https://seu-projeto.netlify.app`

---

## 📋 Checklist Antes do Deploy

Antes de colocar em produção, certifique-se de:

### 1. Regras de Segurança do Firestore

⚠️ **IMPORTANTE:** As regras atuais permitem acesso total ao banco de dados!

Atualize as regras no Firebase Console > Firestore Database > Regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção de usuários - apenas leitura autenticada
    match /usuarios/{userId} {
      allow read: if true; // Para login
      allow write: if false; // Apenas pelo console
    }
    
    // Coleção de EGs - apenas usuários autenticados
    match /tab_eg/{egId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

### 2. Segurança de Senhas

⚠️ **AVISO:** Atualmente as senhas estão em texto plano!

Para produção, você deveria:
- Usar Firebase Authentication em vez de autenticação manual
- Nunca armazenar senhas em texto plano
- Implementar hash de senhas

### 3. Variáveis de Ambiente (Opcional)

Para maior segurança, mova as credenciais do Firebase para variáveis de ambiente:

**Arquivo: `.env`**
```env
VITE_FIREBASE_API_KEY=AIzaSyAA_7yl3lvAty58cTGsSzARUl2l8TB-rg0
VITE_FIREBASE_AUTH_DOMAIN=eg-control.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eg-control
VITE_FIREBASE_STORAGE_BUCKET=eg-control.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=167225225737
VITE_FIREBASE_APP_ID=1:167225225737:web:9e003c7cc0231b85113ed8
```

**Atualize `/lib/firebase.ts`:**
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 4. Domínio Personalizado (Opcional)

Após o deploy, você pode configurar um domínio próprio:
- Vercel: Settings > Domains
- Firebase: Hosting > Add custom domain
- Netlify: Domain settings > Add custom domain

---

## 🚀 Recomendação Final

**Para começar rapidamente:** Use a **Vercel**
- Deploy em 5 minutos
- Atualização automática quando você fizer push no GitHub
- SSL/HTTPS automático
- CDN global
- 100% gratuito para projetos pessoais

**Precisa de ajuda?** A documentação da Vercel é excelente: https://vercel.com/docs

---

## 📱 Testando em Produção

Após o deploy:
1. ✅ Teste o login com um usuário real
2. ✅ Teste o registro de EG
3. ✅ Teste o gerenciamento de usuários (como admin)
4. ✅ Teste em dispositivos mobile
5. ✅ Verifique se as regras do Firestore estão funcionando

---

## 🔒 Melhorias de Segurança Futuras

Para uma aplicação em produção séria, considere:

1. **Usar Firebase Authentication**
   - Autenticação segura nativa
   - Recuperação de senha
   - Verificação de email

2. **Criptografia de Senhas**
   - Se continuar com autenticação manual, use bcrypt ou similar

3. **Rate Limiting**
   - Proteção contra ataques de força bruta

4. **Logs e Monitoramento**
   - Firebase Analytics
   - Sentry para rastreamento de erros

5. **Backup Automático**
   - Backup regular do Firestore
