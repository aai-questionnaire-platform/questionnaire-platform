import styled from "styled-components";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Fab,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  ToggleButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedIcon from "@mui/icons-material/Verified";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import { List, ListElement, FabContainer } from "../components/common";
import { postService, useCategories, useServices } from "../api/hooks";
import { Service } from "../api/types";
import Toast from "../components/Toast";

const ButtonArea = styled.div`
  display: flex;
  gap: 10px;
`;

type DataTarget =
  | "title"
  | "serviceProvider"
  | "link"
  | "coverPhoto"
  | "description"
  | "categoryId"
  | "coverPhotoAltText"
  | "forYou";

type AccordionServiceData = Service & { expanded?: boolean };

const Services = () => {
  const [servicesData, setServicesData] = useState<AccordionServiceData[]>([]);
  const [savedServices, setSavedServices] = useState(false);

  const handleChange = (event: any, dataTarget: DataTarget, id: string) => {
    const tempState = servicesData.map((srvc: any) => {
      return { ...srvc };
    });
    const targetField = tempState.find((srvc: Service) => srvc.id === id)[
      dataTarget
    ];
    tempState.find((srvc: Service) => srvc.id === id)[dataTarget] =
      dataTarget === "forYou" ? !targetField : event.target.value;
    setServicesData(tempState);
  };

  const handleRemove = (id: string) => {
    const cleanedServices = servicesData.filter((service) => service.id !== id);
    setServicesData(cleanedServices);
  };

  const handleAddService = () => {
    const emptyService = {
      title: "Uusi palvelu",
      categoryId: "",
      id: uuid(),
      serviceProvider: "",
      description: "",
      link: "",
      forYou: false,
      coverPhoto: "",
      coverPhotoAltText: "",
      expanded: true,
    };
    setServicesData((servicesData) => [...servicesData, emptyService]);
  };

  const handleSubmitServices = async () => {
    const saved = await postService(servicesData);
    if (saved.status === 200) {
      setSavedServices(true);
      setTimeout(() => {
        setSavedServices(false);
      }, 3000);
    }
  };

  const {
    data: servicesApiData,
    error: servicesApiError,
    loading: servicesApiLoading,
  } = useServices();
  const {
    data: categoriesApiData,
    error: categoriesApiError,
    loading: categoriesApiLoading,
  } = useCategories();

  const getCategory = (categoryId: string) => {
    return categoriesApiData?.find((category) => category.id === categoryId)
      ?.id;
  };

  useEffect(() => {
    if (servicesApiData) {
      setServicesData(servicesApiData);
    }
  }, [servicesApiData]);

  if (servicesApiLoading || categoriesApiLoading) {
    return <>Ladataan sisältöä</>;
  }

  return (
    <>
      {(servicesApiError || categoriesApiError) && (
        <Toast message="Virhe ladattaessa sisältöä" />
      )}
      {savedServices && <Toast message="Tallennettu!" />}
      <List>
        {servicesData.map((service, index) => {
          return (
            <ListElement key={`${service.id}`}>
              <Accordion expanded={service.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography>{service.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="demo-simple-select-label">
                      Kategoria
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      defaultValue={getCategory(service.categoryId)}
                      label="Kategoria"
                      onChange={(event) =>
                        handleChange(event, "categoryId", service.id)
                      }
                    >
                      {categoriesApiData?.map((category) => (
                        <MenuItem key={category.id} value={category.id ?? " "}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    id="outlined-basic"
                    label="Nimi"
                    variant="outlined"
                    defaultValue={service.title ?? " "}
                    margin="normal"
                    fullWidth
                    onChange={(event) =>
                      handleChange(event, "title", service.id)
                    }
                  />
                  <TextField
                    id="outlined-basic"
                    label="Palveluntarjoaja"
                    variant="outlined"
                    defaultValue={service.serviceProvider ?? " "}
                    fullWidth
                    margin="normal"
                    onChange={(event) =>
                      handleChange(event, "serviceProvider", service.id)
                    }
                  />
                  <TextField
                    id="outlined-basic"
                    label="Linkki"
                    variant="outlined"
                    defaultValue={service.link ?? " "}
                    fullWidth
                    margin="normal"
                    onChange={(event) =>
                      handleChange(event, "link", service.id)
                    }
                  />
                  <TextField
                    id="outlined-basic"
                    label="Kuvan osoite"
                    variant="outlined"
                    defaultValue={service.coverPhoto ?? " "}
                    fullWidth
                    margin="normal"
                    onChange={(event) =>
                      handleChange(event, "coverPhoto", service.id)
                    }
                  />
                  <TextField
                    id="outlined-basic"
                    label="Kuvan alt-teksti"
                    variant="outlined"
                    fullWidth
                    defaultValue={service.coverPhotoAltText ?? " "}
                    margin="normal"
                    onChange={(event) =>
                      handleChange(event, "coverPhotoAltText", service.id)
                    }
                  />
                  <TextField
                    id="outlined-basic"
                    label="Kuvaus"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    fullWidth
                    defaultValue={service.description ?? " "}
                    margin="normal"
                    onChange={(event) =>
                      handleChange(event, "description", service.id)
                    }
                  />
                  <ButtonArea>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemove(service.id)}
                      color="error"
                    >
                      Poista
                    </Button>
                    <ToggleButton
                      value="forYou"
                      selected={service.forYou}
                      color="primary"
                      onChange={(event) =>
                        handleChange(event, "forYou", service.id)
                      }
                    >
                      <VerifiedIcon /> Sinulle
                    </ToggleButton>
                  </ButtonArea>
                </AccordionDetails>
              </Accordion>
            </ListElement>
          );
        })}
        <Fab
          color="primary"
          aria-label="add"
          variant="extended"
          onClick={handleAddService}
        >
          Lisää palvelu <AddIcon />
        </Fab>
      </List>
      <FabContainer>
        <Fab
          color="primary"
          aria-label="add"
          variant="extended"
          onClick={handleSubmitServices}
        >
          Tallenna muutokset <SaveAltIcon />
        </Fab>
      </FabContainer>
    </>
  );
};

export default Services;
