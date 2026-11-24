import PageSchema from '@/components/PageSchema';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/lending-partners" name="Lending Partners" />
      {children}
    </>
  );
}
