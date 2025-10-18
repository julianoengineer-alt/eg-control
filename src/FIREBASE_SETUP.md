# Configuração do Firebase

## Passos importantes:

### 1. Regras de Segurança do Firestore

Acesse o Console do Firebase > Firestore Database > Regras

Cole as seguintes regras (para desenvolvimento):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANTE**: Estas regras permitem acesso total ao banco. Para produção, você deve implementar regras mais restritivas.

### 2. Estrutura das Coleções

#### Coleção: `usuario`
Campos obrigatórios:
- `nome` (string) - Nome completo do usuário
- `email` (string) - Email do usuário
- `senha` (string) - Senha em texto plano (não recomendado para produção)
- `turno` (string) - Turno de trabalho (Manhã, Tarde ou Noite)

Exemplo de documento:
```
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "turno": "Manhã"
}
```

#### Coleção: `tab_eg`
Campos obrigatórios:
- `eg` (string) - Número da EG com 18 dígitos
- `usuario` (string) - Nome do usuário que registrou
- `data` (timestamp) - Data e hora do registro

Exemplo de documento:
```
{
  "eg": "123456789012345678",
  "usuario": "João Silva",
  "data": Timestamp (gerado automaticamente)
}
```

### 3. Criar primeiro usuário

No Console do Firebase:
1. Vá em Firestore Database
2. Clique em "Iniciar coleção"
3. Nome da coleção: `usuario`
4. Adicione os campos acima
5. Salve

### 4. Verificar problemas de login

Abra o Console do navegador (F12) e verifique os logs ao tentar fazer login.
Os logs mostrarão informações detalhadas sobre o processo de autenticação.
