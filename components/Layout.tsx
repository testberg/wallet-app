import { Box } from "@mui/material";
import Header from "./header";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 900, margin: "0 auto" }}>{children}</Box>
    </>
  );
}
