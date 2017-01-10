import React from 'react';
import {Editor,EditorState} from 'draft-js';
import ReactDOM from "react-dom";

export default class App extends React.Component{

    constructor(props)
    {
        super(props);
        this.state={editorState: EditorState.createEmpty()};
        this.onChange= (editorState) => this.setState({editorState});
    }
    render()
    {
        return(
            <div id="content">
                <div className="editor">
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }

}
ReactDOM.render(
  <App/>,
  document.body
);