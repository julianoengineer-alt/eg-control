import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function TestFirestore() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testando conexão com Firestore...');
      
      // Tenta buscar todos os usuários
      const usuariosRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      
      console.log('Conexão bem-sucedida!');
      console.log('Total de usuários encontrados:', snapshot.size);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Usuários:', usersData);
      
      setUsuarios(usersData);
      setConnectionOk(true);
      
      if (snapshot.size === 0) {
        setError('Conexão OK, mas nenhum usuário encontrado na coleção "usuarios". Crie um usuário no Firebase Console.');
      }
    } catch (err: any) {
      console.error('Erro ao conectar:', err);
      setError(`Erro: ${err.message}`);
      setConnectionOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Conexão - Firestore</CardTitle>
            <CardDescription>
              Verificação da conexão com o Firebase e listagem de usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={loading}>
                {loading ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>

            {connectionOk && !error && (
              <Alert className="bg-primary/10 border-primary">
                <AlertDescription>
                  ✅ Conexão com Firestore estabelecida com sucesso!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-destructive/10 border-destructive">
                <AlertDescription className="text-destructive">
                  ❌ {error}
                </AlertDescription>
              </Alert>
            )}

            {usuarios.length > 0 && (
              <div className="space-y-2">
                <h3>Usuários Cadastrados ({usuarios.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Senha</TableHead>
                        <TableHead>Turno</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>{user.nome || '❌ Campo ausente'}</TableCell>
                          <TableCell>{user.email || '❌ Campo ausente'}</TableCell>
                          <TableCell className="font-mono">{user.senha || '❌ Campo ausente'}</TableCell>
                          <TableCell>{user.turno || '❌ Campo ausente'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium">Instruções:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Acesse o Firebase Console: console.firebase.google.com</li>
                <li>Vá em "Firestore Database"</li>
                <li>Clique em "Iniciar coleção" (se ainda não existe)</li>
                <li>Nome da coleção: <code className="bg-muted px-1">usuarios</code></li>
                <li>Adicione um documento com os campos: nome, email, senha, turno</li>
                <li>Certifique-se de que os nomes dos campos estão EXATAMENTE assim (minúsculas)</li>
                <li>Verifique as Regras de Segurança (veja FIREBASE_SETUP.md)</li>
              </ol>
            </div>

            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
