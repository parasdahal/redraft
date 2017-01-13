import React from 'react';
import {Editor,EditorState,RichUtils} from 'draft-js';
import ReactDOM from 'react-dom';
import StyleButton from './styleButton'

export default class App extends React.Component{

    constructor(props)
    {
        super(props);
        this.state ={editorState: EditorState.createEmpty()};
        this.onChange = (editorState) => this.setState({editorState});
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        const {editorState} = this.state;
    }
    _handleKeyCommand(command)
    {
        const newState = RichUtils.handleKeyCommand(this.state.editorState,command);
        if(newState)
        {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    _toggleBlockType(blockType)
    {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }
    render()
    {
        const {editorState} = this.state;
        return(
                <div className="editor">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                       <Editor
                            editorState={this.state.editorState}
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange}
                            spellCheck = {true}
                        />
                </div>
        );
    }

}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'Quote', style: 'blockquote'},
    {label: 'Bullets', style: 'unordered-list-item'},
    {label: 'Numbers', style: 'ordered-list-item'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

