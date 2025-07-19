
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterForm from '@/components/RegisterForm';

const RegisterPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-paired-50">
        <div className="w-full max-w-md px-4">
          <RegisterForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
