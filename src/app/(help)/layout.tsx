import MainFooter from "@/components/sections/main-footer";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MainFooter />
    </>
  );
}
