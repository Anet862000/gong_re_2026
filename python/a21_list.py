import datetime

def main():
    list_a = []
    list_b = list()

    print(type(list_a))
    print(type(list_b))

    ptime = datetime.datetime.now()
    list_c = [1, 2, 3.3, 'Lee', ptime, True]

    print(list_c[3])
    print(list_c[-1])
    list_c[0] = 'youn'
    print(list_c)