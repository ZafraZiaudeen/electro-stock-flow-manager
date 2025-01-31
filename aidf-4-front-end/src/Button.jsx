function Button(props ) {
  
    return (
        <button
            type="button"
            className="bg-blue-500 text-white border-black 
            border-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 mx-4"
            onClick={props.onclick}
        >
            {props.children}
        </button>
    );
}

export default Button;
