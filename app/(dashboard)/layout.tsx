import { currentUser } from '@/lib/auth';
import { Header } from './components/header';

async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default Layout;

