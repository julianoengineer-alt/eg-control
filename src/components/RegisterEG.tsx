import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner@2.0.3";

export function RegisterEG() {
  const { currentUser } = useAuth();
  const [eg, setEg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (eg.length !== 18) {
      toast.error("A EG deve conter exatamente 18 números");
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      
      // Salvar no Firestore
      const tabEgRef = collection(db, 'tab_eg');
      await addDoc(tabEgRef, {
        eg: eg,
        usuario: currentUser.nome,
        data: Timestamp.now(),
      });

      toast.success("EG registrada com sucesso!");
      setEg("");
    } catch (error) {
      toast.error("Erro ao registrar EG");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 18);
    setEg(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Registrar EG</CardTitle>
            <CardDescription>
              Insira a EG de 18 números para registrar no sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eg">EG (18 números)</Label>
                <Input
                  id="eg"
                  type="text"
                  placeholder="000000000000000000"
                  value={eg}
                  onChange={handleEGChange}
                  maxLength={18}
                  required
                  className="font-mono tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  {eg.length}/18 números digitados
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading || eg.length !== 18}>
                  {loading ? "Registrando..." : "Registrar EG"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEg("")}
                  disabled={loading}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}
