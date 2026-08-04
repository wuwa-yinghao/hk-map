import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import CalculatorPage from '@/pages/CalculatorPage';
import NotFound from '@/pages/not-found';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalculatorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
