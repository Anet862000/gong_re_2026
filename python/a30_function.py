def print_hello(a : int):
    for _ in range(a):
        print('안녕하세요', a)

    return "execution OK"


    
def main():
    re = print_hello(3)
    print(re)
    



if __name__ == "__main__":
    main()