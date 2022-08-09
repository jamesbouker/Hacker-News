import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Pagination,
  Form,
  Spinner,
  FormControl,
  FormGroup,
  Col,
  Row,
  Container,
} from "react-bootstrap";
import "./App.css";

const BASE_URL = "http://hn.algolia.com/api/v1/search?query=";

function App() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    fetchData(0);
  }

  const fetchData = useCallback(
    (indexOverride) => {
      setPageIndex(indexOverride);
      setIsLoading(true);

      const url = `${BASE_URL}${searchText}&page=${indexOverride}`;
      console.log(url);

      axios({
        method: "get",
        url: url,
        responseType: "json",
      })
        .then(function (response) {
          setIsLoading(false);
          setSearchResults([]);

          console.log(response.data);

          setNumberOfPages(response.data.nbPages);

          const items = response.data.hits
            .map((hit) => {
              if (hit.title != null && hit.url != null) {
                return {
                  title: hit.title.length > 0 ? hit.title : hit.story_title,
                  url: hit.url.length > 0 ? hit.url : hit.story_url,
                  id: uuid(),
                };
              }
              return null;
            })
            .filter((i) => i != null);
          setSearchResults(items);
          setError("");
        })
        .catch(function (error) {
          setIsLoading(false);
          setSearchResults([]);
          setPageIndex(0);
          setNumberOfPages(0);
          setError(error.message ?? "Unknown error ocurred");
        });
    },
    [searchText]
  );

  const pagination = useMemo(() => {
    let items = [];
    let start = Math.max(pageIndex - 3, 0);
    let end = Math.min(pageIndex + 3, numberOfPages - 1);

    for (let number = start; number <= end; number++) {
      items.push(
        <Pagination.Item
          onClick={() => {
            fetchData(number);
          }}
          key={number}
          active={number === pageIndex}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination>
        {pageIndex > 0 && (
          <Pagination.First
            onClick={() => {
              fetchData(0);
            }}
          />
        )}
        {items}{" "}
        {numberOfPages > 0 && pageIndex < numberOfPages - 1 && (
          <Pagination.Last
            onClick={() => {
              fetchData(numberOfPages - 1);
            }}
          />
        )}
      </Pagination>
    );
  }, [fetchData, numberOfPages, pageIndex]);

  return (
    <Container>
      <h1>React Get Data</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Row>
            <Col>
              <FormControl
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                value={searchText}
                type="text"
              />
            </Col>
            <Col>
              <Button type="submit">Search</Button>
            </Col>
          </Row>
        </FormGroup>
      </Form>
      {isLoading && (
        <Spinner style={{ margin: "1rem" }} animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {error && <p>{error}</p>}
      {!isLoading && (
        <ul className="search-results">
          {searchResults.map((item, index) => {
            return (
              <li key={index}>
                <a href={item.url}>{item.title}</a>
              </li>
            );
          })}
        </ul>
      )}
      {pagination}
    </Container>
  );
}

export default App;
