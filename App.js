import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, SafeAreaView, FlatList} from 'react-native';
import {useEffect, useRef, useState} from "react";


const dayFR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const TIME_DURATION = {
    MINUTE: 60,
    HOUR: 60 * 60,
    DAY: 24 * 60 * 60,
}

const dayList = [
    { id: 1, day: 1, hours: 17, min: 0 }, // Lundi 17:00
    { id: 2, day: 4, hours: 2, min: 37 }, // Jeudi 2:37
    { id: 3, day: 6, hours: 14, min: 54 }, // Samedi 14:54
]

const EventDateItem = ({ data }) => {
    return(
        <Text>{translateDateToFR(data.day)} à {data.hours}:{data.min}</Text>
    )
}

const ListEvent = () => {

    return(
        <SafeAreaView style={styles.eventList}>
            <Text>Les events se lance tout les :</Text>
            <FlatList
                data={dayList}
                renderItem={ ({ item }) => <EventDateItem data={item} />}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    )
}

const getInterval = (days) => {
    const now = new Date(Date.now())
    days.sort((acc, val) => {
        const a = acc.day * 100 + acc.hours * 10 + acc.min
        const b = val.day * 100 + val.hours * 10 + val.min
        return a - b
    })
    const target = days.find((el) => {
        const nowWeight = now.getDay() * 100 + now.getHours() * 10 + now.getMinutes()
        const elementWeight = el.day * 100 + el.hours * 10 + el.min
        if (nowWeight < elementWeight) return el
    }) ?? days[0]

    const dayInterval = target.day >= now.getDay()
        ? target.day - now.getDay()
        : (6 - now.getDay() + target.day + 1) % 6

    const dateNumber = now.getDate() + dayInterval

    const newDate = new Date(now.toString())
    newDate.setHours(target.hours, target.min, 0)
    newDate.setDate(dateNumber)
    
    const interval = (newDate.getTime() - now.getTime())
    return [Math.floor(interval / 1000), newDate]
}

const getIntervalCounter = (time) => {
    const day = Math.floor(time / TIME_DURATION.DAY)
    const hours = Math.floor(time / TIME_DURATION.HOUR) % 24
    const minutes = Math.floor(time / TIME_DURATION.MINUTE) % 60
    const seconds = time % 60

    return [day, hours, minutes, seconds]
}

const formatTime = (num) => {
    return num.toString().padStart(2, '0')
}

const formatWord = (num) => {
    return num > 1 ? 's' : ''
}

const translateDateToFR = (day) => {
    return dayFR[day]
}

const Timer = (props) => {
    const timer = useRef(null)
    const [time, setTime] = useState(0);
    const [date, setDate] = useState(new Date())

    const changeTime = () => {
        const [interval, date] = getInterval(props.days)
        setTime(interval)
        setDate(date)
    }

    useEffect(() => {
        timer.current = setInterval(() => {
            if (time <= 0)
                changeTime()
            else
                setTime((prev) => prev - 1)

        }, 1000)
        changeTime()
        return () => clearInterval(timer.current)
    }, []);


    const [day, hours, minutes, seconds] = getIntervalCounter(time)

    return (
        <>
            <Text style={styles.title}>Prochain event : {translateDateToFR(date.getDay())} {date.getDate()} à {date.getHours()}:{date.getMinutes()}</Text>
            <ListEvent/>
            <Text>Prochain event dans :</Text>
            <Text style={styles.timer}>
                {day} jour{formatWord(day)}, {hours} heure{formatWord(hours)}, {formatTime(minutes)} minute{formatWord(minutes)} et {formatTime(seconds)} seconde{formatWord(seconds)}
            </Text>
        </>
    )
}

export default function App() {
    return (
        <View style={styles.container}>
            <Timer days={dayList.slice()}/>
            <StatusBar style="auto"/>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        top: -250,
        fontSize: 22
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timer: {
        marginTop: 5,
        padding: 10,
        flexDirection: "row",
        backgroundColor: "#d9dbda",
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventList: {
        height: 100,
        top: -230,
        marginLeft: -130
    }
});
