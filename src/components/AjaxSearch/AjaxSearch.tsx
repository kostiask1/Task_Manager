import { createElement, FC, InputHTMLAttributes, useEffect, useState } from 'react';
import Input from '../UI/Input';
import "./AjaxSearch.scss";

interface AjaxSearchProps {
  request: (params: any) => Promise<any>,
  transformer: (response: any) => Element | Element[] | any,
  responseParams?: string[],
  emptySearch?: boolean,
  autoClose?: boolean,
  inputProps?: InputHTMLAttributes<HTMLInputElement> | object
}

const AjaxSearch: FC<AjaxSearchProps> = ({ request, transformer, responseParams, emptySearch = true, autoClose = true, inputProps = {} }) => {
  const [inputVal, setInputVal] = useState("")
  const [response, setResponse] = useState([])
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) return setInputVal("")
    setInputVal(value)
    if ((!value && emptySearch) || value) { sendRequest(value) } else { setResponse([]) }
  }

  useEffect(() => {
    document.addEventListener("mouseup", handleClick)
    return () => document.removeEventListener("mouseup", handleClick)

  }, [focus])

  const handleClick = (e: MouseEvent) => {
    if (focus) {
      const target: any = e.target

      if (target.classList.contains("input")) return
      
      if (target && target.parentNode.nodeName.toLowerCase() === 'li') {
        
        if (autoClose) {
          setFocus(false)
        } else {
          setFocus(true)
        }
      } else {
        setFocus(false)
      }
    }
  }

  const sendRequest = (value?: string) => {
    const search = value || inputVal;

    if ((!search && emptySearch) || search) {
      setLoading(true)
      request(search).then(response => {
        setLoading(false)
        setResponse(response)
      })
    }
    if (!search && !emptySearch) return setResponse([])
  }

  const generateResponse = () => {
    if (!response.length) return []
    if (!responseParams?.length) return response

    return response.map(item => {
      const obj: any = {}
      responseParams.forEach(key => obj[key] = item[key])
      return obj
    })
  }

  const elements = transformer(generateResponse())
  const elementsList = elements?.length && elements.map((el: any, index: number) => createElement('li', {'key': index}, el)) || []

  return (
    <div className={`AjaxSearchWrapper ${focus ? "open" : ""}`}>
      <Input
        name="user"
        className="input mt-2"
        placeholder="Test"
        value={inputVal}
        onFocus={() => {
          setFocus(true)
          sendRequest()
        }}
        onChange={handleSearch}
        list="users_ids"
        {...inputProps}
      />
      <ul className="AjaxSearchWrapper__results">{loading && "Loading..." || elementsList.length && elementsList || ((inputVal || (!inputVal && emptySearch)) && "nothing found") || null}</ul>
    </div>
  );
};

export default AjaxSearch;
