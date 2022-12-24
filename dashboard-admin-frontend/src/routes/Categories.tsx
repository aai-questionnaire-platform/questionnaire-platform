import { Fab, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import styled from "styled-components";

import { List, ListElement } from "../components/common";
import { useCategories } from "../api/hooks";

const Item = styled(Paper)`
  padding: 20px;
`;

const Categories = () => {
  const { data, error, loading } = useCategories();

  if (error) <>Virhe</>;

  if (loading) <>Ladataan</>;

  return (
    <>
      <List>
        {data?.map((category) => (
          <ListElement key={category.id}>
            <Item elevation={8}>{category.name}</Item>
          </ListElement>
        ))}
        <Fab color="primary" aria-label="add" variant="extended" disabled>
          Lisää kategoria <AddIcon />
        </Fab>
      </List>
    </>
  );
};

export default Categories;
