import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "./Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, FileText, UserPlus, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface EGRecord {
  id: string;
  eg: string;
  usuario: string;
  data: Timestamp;
}

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EGRecord[]>([]);
  const [recentRecords, setRecentRecords] = useState<EGRecord[]>([]);
  const [stats, setStats] = useState({
    //egReadToday: 0,
    //egReadYesterday: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Buscar últimos registros
      const tabEgRef = collection(db, 'tab_eg');
      const recentQuery = query(tabEgRef, orderBy('data', 'desc'), limit(3));
      const recentSnapshot = await getDocs(recentQuery);
      
      const records: EGRecord[] = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        eg: doc.data().eg,
        usuario: doc.data().usuario,
        data: doc.data().data,
      }));
      setRecentRecords(records);

      {/*
      // Calcular EGs lidas hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const todayQuery = query(
        tabEgRef,
        where('data', '>=', todayTimestamp)
      );
      const todaySnapshot = await getDocs(todayQuery);
      const egReadToday = todaySnapshot.size;

      // Calcular EGs lidas ontem
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTimestamp = Timestamp.fromDate(yesterday);

      const yesterdayQuery = query(
        tabEgRef,
        where('data', '>=', yesterdayTimestamp),
        where('data', '<', todayTimestamp)
      );
      const yesterdaySnapshot = await getDocs(yesterdayQuery);
      const egReadYesterday = yesterdaySnapshot.size;
      */}

      // Contar usuários ativos
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosRef);
      const activeUsers = usuariosSnapshot.size;

      setStats({
        //egReadToday,
        //egReadYesterday,
        activeUsers,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const tabEgRef = collection(db, 'tab_eg');
      const searchLower = searchQuery.toLowerCase();
      
      // Buscar todos os registros (Firebase não suporta pesquisa parcial diretamente)
      const allQuery = query(tabEgRef, orderBy('data', 'desc'));
      const snapshot = await getDocs(allQuery);
      
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          eg: doc.data().eg,
          usuario: doc.data().usuario,
          data: doc.data().data,
        }))
        .filter(record => 
          record.eg.includes(searchQuery) ||
          record.usuario.toLowerCase().includes(searchLower)
        );

      setSearchResults(results);

      if (results.length === 0) {
        toast.info('Nenhum resultado encontrado');
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      toast.error('Erro ao realizar pesquisa');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const getUserInitials = () => {
    if (!currentUser?.nome) return "U";
    return currentUser.nome.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return currentUser?.nome || "Usuário";
  };

  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Search */}
        <div className="mb-6 md:mb-8">
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por EG ou nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="shrink-0">
              <Search className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Pesquisar</span>
            </Button>
            {isSearching && (
              <Button onClick={handleClearSearch} variant="outline" className="shrink-0">
                <X className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Limpar</span>
              </Button>
            )}
          </div>

          {/* Search Results */}
          {isSearching && searchResults.length > 0 && (
            <Card className="mt-4 max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Resultados da Pesquisa ({searchResults.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EG</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data/Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-xs md:text-sm">{record.eg}</TableCell>
                          <TableCell>{record.usuario}</TableCell>
                          <TableCell className="text-xs md:text-sm">{formatDateTime(record.data)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">EGs lidas Hoje</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/*<div className="text-2xl font-bold">{stats.egReadToday}</div>*/}
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-primary mt-1">
                {/*{stats.egReadToday - stats.egReadYesterday} em relação a ontem*/}
                200 em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">EGs lidas Ontem</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.egReadYesterday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Usuários Ativos</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Usuários cadastrados no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Registros</CardTitle>
            <CardDescription>
              Registros de EGs mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EG</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : recentRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-xs md:text-sm">{record.eg}</TableCell>
                          <TableCell className="text-sm">{record.usuario}</TableCell>
                          <TableCell className="text-xs md:text-sm">{formatDateTime(record.data)}</TableCell>
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
