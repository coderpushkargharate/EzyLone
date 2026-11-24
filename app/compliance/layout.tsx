import PageSchema from '@/components/PageSchema';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/compliance" name="Compliance & Grievance Redressal" />
      {children}
    </>
  );
}
