import React, { Component } from 'react';
import './SearchData.css';

class SearchData extends Component {

    render() {
        const searchComplete = this.props.searchPercentage;

        return(
            <div className="searchdata">
                <p className="completed">Search completed: { searchComplete }%</p>
            </div>
        )
    }
}

export default SearchData;
