import React from 'react'
import { Entity, CompositeDecorator } from 'draft-js'

const styles = {
    'modal':{
        backgroundColor:'#B0DBE2'
    },
    'adverbs':{
        backgroundColor:'#F7EFC0'
    }
};

function getEntityStrategy(entityType) {
    return function(contentBlock, callback, contentState) {
        contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            if (entityKey === null) {
            return false;
            }
            return Entity.get(entityKey).getType() === entityType;
        },
        callback
        );
    };
}

const ModalSpan = (props) => {
    return (
        <span style={styles.modal} data-tooltip="Modal: Remove modal verb">
        {props.children}
        </span>
    );
};
const AdverbsSpan = (props) => {
    return (
        <span style={styles.adverbs} data-tooltip="Adverb: Use a forceful word">
        {props.children}
        </span>
    );
};

const decorator = new CompositeDecorator([
    {
        strategy: getEntityStrategy('modal'),
        component: ModalSpan,
    },
    {
        strategy: getEntityStrategy('adverbs'),
        component: AdverbsSpan,
    }
]);

export default decorator