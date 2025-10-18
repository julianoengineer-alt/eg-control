import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface User {
  id: string;
  nome: string;
  email: string;
  turno: string;
  perfil: string;
}

export function UserManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    turno: "",
    perfil: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const usuariosRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      
      const usersData: User[] = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        email: doc.data().email,
        turno: doc.data().turno,
        perfil: doc.data().perfil || 'usuario',
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nome: user.nome,
        email: user.email,
        senha: "",
        turno: user.turno,
        perfil: user.perfil,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        turno: "",
        perfil: "usuario",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({
      nome: "",
      email: "",
      senha: "",
      turno: "",
      perfil: "usuario",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.turno || !formData.perfil) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!editingUser && !formData.senha) {
      toast.error("A senha é obrigatória para novos usuários");
      return;
    }

    try {
      setLoading(true);

      if (editingUser) {
        // Atualizar usuário existente
        const userRef = doc(db, 'usuarios', editingUser.id);
        const updateData: any = {
          nome: formData.nome,
          email: formData.email,
          turno: formData.turno,
          perfil: formData.perfil,
        };
        
        // Só atualiza a senha se foi fornecida
        if (formData.senha) {
          updateData.senha = formData.senha;
        }

        await updateDoc(userRef, updateData);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Adicionar novo usuário
        const usuariosRef = collection(db, 'usuarios');
        await addDoc(usuariosRef, {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          turno: formData.turno,
          perfil: formData.perfil,
        });
        toast.success("Usuário cadastrado com sucesso!");
      }

      handleCloseDialog();
      loadUsers(); // Recarrega a lista
    } catch (error) {
      toast.error("Erro ao salvar usuário");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie os usuários do sistema
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum usuário cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.nome}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>{user.turno}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            user.perfil === 'admin' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {user.perfil}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden md:inline">Alterar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog for Add/Edit User */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Alterar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Atualize as informações do usuário" 
                : "Preencha os dados para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Nome do usuário"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">
                  Senha {editingUser && "(deixe em branco para manter a atual)"}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={formData.turno}
                  onValueChange={(value) => setFormData({ ...formData, turno: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value) => setFormData({ ...formData, perfil: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : editingUser ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
