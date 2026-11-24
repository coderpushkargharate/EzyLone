import PageSchema from '@/components/PageSchema';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/terms-and-conditions" name="Terms & Conditions" />
      {children}
    </>
  );
}
