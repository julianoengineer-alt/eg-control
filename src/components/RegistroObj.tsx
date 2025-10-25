import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner@2.0.3";
import { Search, X, Package } from "lucide-react";

interface ObjetoRecord {
  id: string;
  objeto: string;
  viagem: number;
  usuario: string;
  data: Timestamp;
}

export function RegistroObj() {
  const { currentUser } = useAuth();
  const [objeto, setObjeto] = useState("");
  const [viagem, setViagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepViagem, setKeepViagem] = useState(false);
  const [searchObjeto, setSearchObjeto] = useState("");
  const [searchResults, setSearchResults] = useState<ObjetoRecord[]>([]);
  const [recentRecords, setRecentRecords] = useState<ObjetoRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [objetosHoje, setObjetosHoje] = useState(0);

  // Carregar últimos registros e estatísticas ao montar o componente
  useEffect(() => {
    loadRecentRecords();
    loadTodayStats();
  }, []);

  const loadRecentRecords = async () => {
    try {
      const tabObjetoRef = collection(db, "tab_objeto");
      const q = query(tabObjetoRef, orderBy("data", "desc"), limit(3));
      const querySnapshot = await getDocs(q);
      
      const records: ObjetoRecord[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        objeto: doc.data().objeto,
        viagem: doc.data().viagem,
        usuario: doc.data().usuario,
        data: doc.data().data,
      }));
      
      setRecentRecords(records);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioHoje = Timestamp.fromDate(hoje);

      const tabObjetoRef = collection(db, "tab_objeto");
      const q = query(tabObjetoRef, where("data", ">=", inicioHoje));
      const querySnapshot = await getDocs(q);
      
      setObjetosHoje(querySnapshot.size);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objeto || !viagem) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    
    if (!currentUser) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      
      // Salvar no Firestore
      const tabObjetoRef = collection(db, 'tab_objeto');
      await addDoc(tabObjetoRef, {
        objeto: objeto,
        viagem: parseInt(viagem),
        usuario: currentUser.nome,
        data: Timestamp.now(),
      });

      toast.success("Objeto registrado com sucesso!");
      
      // Limpar campos baseado no checkbox
      if (keepViagem) {
        // Mantém viagem, limpa só objeto
        setObjeto("");
      } else {
        // Limpa ambos
        setObjeto("");
        setViagem("");
      }
      
      // Recarregar registros recentes e estatísticas
      await loadRecentRecords();
      await loadTodayStats();
    } catch (error) {
      toast.error("Erro ao registrar objeto");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchObjeto.trim()) {
      toast.error("Digite um número de objeto para pesquisar");
      return;
    }

    try {
      setSearching(true);
      setHasSearched(true);
      const tabObjetoRef = collection(db, "tab_objeto");
      const q = query(
        tabObjetoRef,
        where("objeto", "==", searchObjeto.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      const records: ObjetoRecord[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        objeto: doc.data().objeto,
        viagem: doc.data().viagem,
        usuario: doc.data().usuario,
        data: doc.data().data,
      }));
      
      // Ordenar por data no código (mais recente primeiro)
      records.sort((a, b) => b.data.toMillis() - a.data.toMillis());
      
      setSearchResults(records);
      
      if (records.length === 0) {
        toast.info("Nenhum registro encontrado para este objeto");
      } else {
        toast.success(`${records.length} registro(s) encontrado(s)`);
      }
    } catch (error) {
      toast.error("Erro ao pesquisar objeto");
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchObjeto("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 18);
    setViagem(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-4 md:py-8 space-y-6">
        {/* Card de Estatísticas */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Objetos Lidos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/*<div className="text-3xl">{objetosHoje}</div>*/}
              <div className="text-3xl">100</div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      

        {/* Card de Registro */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Registrar Objeto</CardTitle>
            <CardDescription>
              Insira o número do objeto e da viagem para registrar no sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="objeto">Número do Objeto</Label>
                  <Input
                    id="objeto"
                    type="text"
                    placeholder="000000000000000000"
                    value={objeto}
                    onChange={(e) => setObjeto(e.target.value)}
                    maxLength={18}
                    required
                    className="font-mono"
                  />
                <p className="text-xs text-muted-foreground">
                  {objeto.length}/18 números digitados
                </p>
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="viagem">Número da Viagem</Label>
                  <Input
                    id="viagem"
                    type="text"
                    placeholder="Digite o número da viagem"
                    value={viagem}
                    onChange={handleViagemChange}
                    maxLength={7}
                    required
                    className="font-mono"
                  />

                <p className="text-xs text-muted-foreground">
                  {viagem.length}/7 números digitados
                </p>
                  
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keepViagem"
                  checked={keepViagem}
                  onCheckedChange={(checked) => setKeepViagem(checked as boolean)}
                />
                <Label
                  htmlFor="keepViagem"
                  className="text-xs text-muted-foreground"
                >
                  Manter número da viagem após registrar
                </Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading || !objeto || !viagem}>
                  {loading ? "Registrando..." : "Registrar Objeto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setObjeto("");
                    setViagem("");
                  }}
                  disabled={loading}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Card de Pesquisa */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Pesquisar Objeto</CardTitle>
            <CardDescription>
              Digite o número do objeto para buscar todos os registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Digite o número do objeto"
                  value={searchObjeto}
                  onChange={(e) => setSearchObjeto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="font-mono"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !searchObjeto}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {searching ? "Buscando..." : "Buscar"}
              </Button>
              {searchObjeto && (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  size="icon"
                  title="Limpar pesquisa"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Resultados da Busca */}
        {hasSearched && (
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>
                Resultados para Objeto: {searchObjeto}
              </CardTitle>
              <CardDescription>
                Mostrando todos os registros do objeto {searchObjeto}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Objeto</TableHead>
                      <TableHead>Viagem</TableHead>
                      <TableHead>Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      searchResults.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.data)}</TableCell>
                          <TableCell className="font-mono">{record.objeto}</TableCell>
                          <TableCell className="font-mono">{record.viagem}</TableCell>
                          <TableCell>{record.usuario}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Últimos Registros */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Últimos Registros</CardTitle>
            <CardDescription>
              Mostrando os 3 registros mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Viagem</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.data)}</TableCell>
                        <TableCell className="font-mono">{record.objeto}</TableCell>
                        <TableCell className="font-mono">{record.viagem}</TableCell>
                        <TableCell>{record.usuario}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
