
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fin-background text-fin-text-primary">
      <h1 className="text-6xl font-bold text-fin-green mb-4">404</h1>
      <p className="text-xl mb-8">Oops! Página não encontrada</p>
      <Link
        to="/"
        className="flex items-center gap-2 text-fin-green hover:underline"
      >
        <ArrowLeft size={16} />
        <span>Voltar para o Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
