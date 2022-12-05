import { FC, useState, useEffect, InputHTMLAttributes } from 'react';
import Input from '../UI/Input';

interface AjaxSelectProps {
  request: (params: any) => Promise<any>,
  transformer: (response: any) => Element | Element[] | any,
  responseParams?: string[],
  emptySearch?: boolean,
  inputProps?: InputHTMLAttributes<HTMLInputElement> | object
}

const AjaxSelect: FC<AjaxSelectProps> = ({ request, transformer, responseParams, emptySearch = true, inputProps = {} }) => {
  const [inputVal, setInputVal] = useState("")
  const [response, setResponse] = useState([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) return setInputVal("")
    setInputVal(value)
  }

  useEffect(() => {
    if ((!inputVal && emptySearch) || inputVal) {
      request(inputVal).then(response => setResponse(response))
    }
    if (!inputVal && !emptySearch) return setResponse([])
  }, [inputVal])

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
  return (
    <>
      <Input
        name="user"
        className="input mt-2"
        placeholder="Test"
        value={inputVal}
        onChange={handleSearch}
        list="users_ids"
        {...inputProps}
      />
      {elements?.length && elements || (inputVal && "nothing found") || null}
    </>
  );
};

export default AjaxSelect;
