# Sistema de Registro de EG's

Sistema de controle e gerenciamento de EG's (Equipamentos de Gás) desenvolvido em React com Firebase.

## 🚀 Funcionalidades

- ✅ Login de usuários com autenticação
- ✅ Dashboard com estatísticas em tempo real
- ✅ Pesquisa de registros de EG
- ✅ Registro de novas EG's
- ✅ Gerenciamento de usuários (apenas admin)
- ✅ Controle de acesso por perfil
- ✅ Interface responsiva para mobile e desktop
- ✅ Tema escuro com amarelo

## 🛠️ Tecnologias

- **Frontend:** React + TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Banco de Dados:** Firebase Firestore
- **Roteamento:** React Router
- **Gerenciamento de Estado:** Context API

## 📁 Estrutura do Banco de Dados

### Coleção: `usuarios`
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "turno": "string (Manhã/Tarde/Noite)",
  "perfil": "string (usuario/admin)"
}
```

### Coleção: `tab_eg`
```json
{
  "eg": "string (18 dígitos)",
  "usuario": "string",
  "data": "timestamp"
}
```

## 🔑 Perfis de Usuário

- **Usuário:** Pode visualizar dashboard e registrar EG's
- **Admin:** Todas as permissões + gerenciamento de usuários

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Smartphones
- 💻 Tablets
- 🖥️ Desktop

## 🚀 Como colocar em Produção

Veja o guia completo em [DEPLOY.md](./DEPLOY.md)

**Opções de deploy:**
- Vercel (Recomendado - mais fácil)
- Firebase Hosting
- Netlify

## ⚙️ Configuração

1. Configure as credenciais do Firebase em `/lib/firebase.ts`
2. Crie a coleção `usuarios` no Firestore
3. Adicione pelo menos um usuário admin
4. Configure as regras de segurança do Firestore

## 📖 Documentação Adicional

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Configuração do Firebase
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy para produção

## 🔒 Segurança

⚠️ **Importante:** Este sistema utiliza autenticação simplificada para desenvolvimento. Para produção, recomenda-se:
- Implementar Firebase Authentication
- Criptografar senhas
- Configurar regras de segurança adequadas no Firestore
- Implementar rate limiting

## 📄 Licença

Projeto desenvolvido para fins educacionais e de controle interno.
