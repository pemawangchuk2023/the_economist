import AppChrome from "@/components/economist/AppChrome";

type EconomistLayoutProps = {
  children: React.ReactNode;
};

const EconomistLayout = ({ children }: EconomistLayoutProps) => (
  <AppChrome>{children}</AppChrome>
);

export default EconomistLayout;
