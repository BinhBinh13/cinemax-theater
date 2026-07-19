import { Outlet } from 'react-router-dom';
import GeneralHeader from './GeneralHeader';
import GeneralFooter from './GeneralFooter';

export default function CustomerLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <GeneralHeader />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <GeneralFooter />
    </div>
  );
}
