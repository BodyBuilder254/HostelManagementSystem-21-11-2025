
import React, {useState, useEffect} from "react";
import styles from "./Counter.module.css";

function Counter(){

    const [count, setCount] = useState(1);

    function handleIncreement(){
        setCount(t=> t + 2);
    }
    function handleDecreement(){
        setCount(t => t -2)
    }
    function handleReset(){
        setCount(1);
    }


    return(
        <div className={styles.myContainer} >
            <div className={styles.display} >{count} </div>
            <div className={styles.controls} >
                <button onClick={handleIncreement}>Increement</button>
                <button onClick={handleDecreement} >Decreement</button>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}

export default Counter;
