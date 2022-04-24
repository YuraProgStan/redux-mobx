import {useState} from "react";

function getInitialState() {
    return {
        title: '',
        text: '',
        id: Date.now()
    }
}

export default function NewPost({onCreate = console.log}) {
    const [state, setState] = useState(() => getInitialState())
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onCreate(state);
            setState(getInitialState);
        }}>
            <div><input
                value={state.title}
                placeholder="title"
                type="text"
                onChange={e => {
                    setState(prevState => ({
                        ...prevState,
                        title: e.target.value
                    }))
                }}
            />
            </div>
            <div>
                <textarea value={state.text} placeholder="text" onChange={
                    e => {
                        setState(prevState => ({
                            ...prevState,
                            text: e.target.value
                        }))
                    }}
                />
            </div>
            <button type="submit">Submit new post</button>
        </form>
    )
}