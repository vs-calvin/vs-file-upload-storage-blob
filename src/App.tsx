// ./src/App.tsx

import React, { useState } from "react";
import styled from "styled-components";
import Path from "path";

import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer,
  createContainers,
} from "./azure-storage-blob";

const Main = styled("div")`
  font-size: 1em;
  display: flex;
  flex-direction: column;
`;

const CardContainer = styled("div")`
  font-size: 1em;
  display: flex;
  flex-wrap: wrap;
  align-content: stretch;
  width: 100%;
`;

const Card = styled("div")`
  padding: 10px;
  height: 200px;
`;

const Button = styled("button")`
  margin: 2px 10px;
  padding: 5px 20px;
  width: 200px;
  font-size: 1em;
  font-weight: 500;
  border: none;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  font-family: sans-serif;
`;

const Label = styled("label")`
  margin: 20px 0px 0px 0px;
`;

const InputLabel = styled("label")`
  text-align: center;
  margin: 2px 10px;
  padding: 5px 0px;
  width: 200px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
`;

const DropDownHeader = styled("div")`
  text-align: center;
  margin: 2px 10px;
  padding: 5px 0px;
  width: 200px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  background: #ffffff;
`;

const DropDownList = styled("ul")`
  padding: 8px 0px;
  width: 200px;
  position: absolute;
  background-color: #f9f9f9;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  margin: 0;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  box-sizing: border-box;
  &:first-child {
    padding-top: 0.8em;
  }
`;

const ListItem = styled("li")`
  padding: 0px 20px;
  list-style: none;
  z-index: 1;
  margin-bottom: 0.8em;
`;

const storageConfigured = isStorageConfigured();
const options = [
  "user-profiles",
  "game-logo-images",
  "game-title-images",
  "game-tile-images",
];
createContainers(options);

const App = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("user-profiles");
  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (value: string) => async () => {
    setSelectedOption(value);
    setIsOpen(false);

    // update container image list
    setBlobList(await getBlobsInContainer(value));
  };

  const [blobList, setBlobList] = useState<string[]>([]);
  const [filesSelected, setFilesSelected] = useState<File[]>([]);
  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const onFileChange = (event: any) => {
    let files: File[] = [];
    Array.from(event.target.files as FileList).forEach((file) =>
      files.push(file)
    );

    setFilesSelected(files);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    let promises = filesSelected.map(async (file) => {
      await uploadFileToBlob(
        file,
        selectedOption ? selectedOption : options[0]
      );
    });
    await Promise.all(promises);

    setBlobList(
      await getBlobsInContainer(selectedOption ? selectedOption : options[0])
    );

    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <Main>
      <Label>Select Container</Label>
      <DropDownHeader onClick={toggling}>{selectedOption}</DropDownHeader>
      {isOpen && (
        <DropDownList>
          {options.map((option) => (
            <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
              {option}
            </ListItem>
          ))}
        </DropDownList>
      )}
      <Label>Choose files</Label>
      {filesSelected.length > 0 && (
        <ul>
          {filesSelected.map((file: File) => (
            <li>{file.name}</li>
          ))}
        </ul>
      )}
      <input
        type="file"
        multiple
        id="upload"
        hidden
        onChange={onFileChange}
        key={inputKey || ""}
      />
      <InputLabel htmlFor="upload">Browse ...</InputLabel>

      <Label>Upload</Label>
      <Button type="submit" onClick={onFileUpload}>
        Start
      </Button>
    </Main>
  );

  // display file name and image
  const DisplayImagesFromContainer = () => (
    <Main>
      <h2>{selectedOption} items</h2>
      <CardContainer>
        {blobList.map((item) => {
          return (
            <Card>
              <img src={item} alt={item} height="200" />
              <br />
              {Path.basename(item)}
            </Card>
          );
        })}
      </CardContainer>
      <br />
      <br />
      <br />
      <ul>
        {blobList.map((item) => {
          return <li>{item}</li>;
        })}
      </ul>
    </Main>
  );

  return (
    <div>
      <h1>Versus Data Uploader</h1>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
      <hr />
      {storageConfigured && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;
