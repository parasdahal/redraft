import React from 'react';
import ReactDOM from 'react-dom';

export default class StyleButton extends React.Component{

    constructor()
    {
        super();
        this.onToggle = (e) =>{
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }
    render()
    {
        let classes = 'stylebutton';
        if(this.props.active)
        {
            classes += ' activebutton';
        }
        return(
            <span className={classes} onMouseDown={this.onToggle}>
                {this.props.label}
            </span>
        )
    }
}